import {promises as fs} from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

/** Replaces one text file by a same-directory rename; this is not a multi-file transaction. */
export async function atomicWrite(file: string, contents: string): Promise<void> {
  const temporary = path.join(path.dirname(file), '.' + path.basename(file) + '.' + randomUUID() + '.tmp');
  let handle: Awaited<ReturnType<typeof fs.open>> | undefined;
  try {
    let mode = 0o600;
    try {
      const previous = await fs.lstat(file);
      if (previous.isSymbolicLink()) throw new Error('Symbolic destination');
      mode = previous.mode & 0o777;
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    handle = await fs.open(temporary, 'wx', mode);
    await handle.writeFile(contents, 'utf8');
    await handle.chmod(mode);
    await handle.sync();
    await handle.close(); handle = undefined;
    await fs.rename(temporary, file);
  } finally {
    await handle?.close();
    await fs.rm(temporary, {force: true});
  }
}
