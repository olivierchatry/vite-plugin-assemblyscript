import asc from "assemblyscript/asc";
import { basename, join } from 'path'
import { tmpdir } from 'os'
import fsp from 'fs/promises'


const DefaultOpts = {
  matcher: /\.as$/,
  compilerOptions: {},
  useAsBind: false,
}

export default (opts) => {
  opts = {
    ...DefaultOpts,
    ...opts,
  }

  return {
    name: 'vite:assemblyscript',
    enforce: 'pre',
    async transform(code, id, opt) {
      if (opts.matcher.test(id)) {
        const fileName = basename(id).replace(/\.[^.]+$/, '')
        const wasmFileName = `${fileName}.wasm`
        const folder = tmpdir()
        const wasmFilePath = join(folder, wasmFileName)
        assemblyscript
        await asCompiler.ready

        const params = [
          opts.useAsBind ? [require.resolve('as-bind/lib/assembly/as-bind.ts'), '--exportRuntime'] : [],
          id,
          '-b',
          wasmFilePath,
          ...Object.entries(opts.compilerOptions).map(([opt, val]) => {
            if (val === true) {
              return `--${opt}`
            }
            return `--${opt}=${val}`
          }),
          opts.fileExtension ? [`--extension`, opts.fileExtension] : [],
        ].flat()
        await new Promise(async (resolve, reject) => {
          asCompiler.main(params, async (err) => {
            if (err) {
              return reject(`${err}`)
            }
            resolve(null)
          })
        })

        const source = await fsp.readFile(wasmFilePath)
        return {
          code: `
            const binaryString = atob("${source.toString('base64')}");
            const bytes = new Uint8Array(binaryString.length);
            for (var i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const module = await WebAssembly.instantiate(bytes.buffer, {});
            export const wasmBinary = bytes.buffer
            export default module.instance.exports
          `,
          map: null // provide source map if available
        }
      }
    }
  }
}