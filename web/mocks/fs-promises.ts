export const readFile = async () => '';
export const writeFile = async () => {};
export const rm = async () => {};
export const mkdir = async () => {};
export const stat = async () => ({ size: 0 });
export const access = async () => {};
export const accessSync = () => {};
export const existsSync = () => false;
export const constants = { W_OK: 1 };
export const createReadStream = () => ({
  on: (event, cb) => {},
  destroy: () => {}
});
export const createWriteStream = () => ({
  on: (event, cb) => {},
  end: (cb) => cb && cb(),
  write: () => true,
  once: (event, cb) => cb && cb()
});
export const readdir = async () => [];
export const open = async () => ({
    read: async () => ({ buffer: new Uint8Array(), bytesRead: 0 }),
    close: async () => {}
});
export const appendFile = async () => {};

export const promises = {
  readFile,
  writeFile,
  rm,
  mkdir,
  stat,
  access,
  readdir,
  open,
  appendFile
};
