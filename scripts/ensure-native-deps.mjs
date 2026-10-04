// node_modules on /mnt/f is shared by Windows and WSL, but npm only installs the
// native bindings for the platform that ran `npm install`. Before dev/build, fill
// in any binding the current platform is missing (rolldown, esbuild, sharp, …)
// by unpacking its tarball in place, without touching the rest of the tree.
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const modules = join(root, 'node_modules');

if (!existsSync(modules)) {
	console.error('[native-deps] node_modules 不存在，请先运行 npm ci');
	process.exit(1);
}

const { platform, arch } = process;
const musl = platform === 'linux' && !process.report.getReport().header.glibcVersionRuntime;
const targets = platform === 'linux' && musl ? [`linux-${arch}`, `linuxmusl-${arch}`] : [`${platform}-${arch}`];

const matches = (name) => {
	const hit = targets.some((target) => new RegExp(`(^|[-/])${target}(-|$)`).test(name));
	if (!hit || platform !== 'linux') return hit;
	return musl ? !/-gnu(eabihf)?$/.test(name) : !/musl/.test(name);
};

const packages = readdirSync(modules)
	.filter((dir) => !dir.startsWith('.'))
	.flatMap((dir) => (dir.startsWith('@') ? readdirSync(join(modules, dir)).map((sub) => `${dir}/${sub}`) : [dir]));

const missing = new Map();
for (const dir of packages) {
	let manifest;
	try {
		manifest = JSON.parse(readFileSync(join(modules, dir, 'package.json'), 'utf8'));
	} catch {
		continue;
	}
	for (const [name, version] of Object.entries(manifest.optionalDependencies ?? {})) {
		if (!matches(name)) continue;
		const installed = [join(modules, name), join(modules, dir, 'node_modules', name)].some((path) =>
			existsSync(join(path, 'package.json')),
		);
		if (!installed) missing.set(name, version);
	}
}

if (missing.size === 0) process.exit(0);

console.log(`[native-deps] 为 ${targets[0]} 补装 ${missing.size} 个原生依赖：`);
const scratch = mkdtempSync(join(tmpdir(), 'native-deps-'));
try {
	for (const [name, version] of missing) {
		console.log(`  - ${name}@${version}`);
		const tarball = execSync(`npm pack "${name}@${version}" --pack-destination "${scratch}" --silent`, {
			cwd: scratch,
			encoding: 'utf8',
		})
			.trim()
			.split(/\r?\n/)
			.pop();
		const dest = join(modules, name);
		mkdirSync(dest, { recursive: true });
		execSync(`tar -xzf "${join(scratch, tarball)}" -C "${dest}" --strip-components=1`);
	}
} finally {
	rmSync(scratch, { recursive: true, force: true });
}
