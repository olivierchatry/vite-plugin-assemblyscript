# vite-plugin-assemblyscript

Simple assemblyscript plugin for vite. 

This will compile all your imported `as` file into a base64 string, and will replace imported AS file with :

```javascript
const binaryString = atob("${source.toString('base64')}");
const bytes = new Uint8Array(binaryString.length);
for (var i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
}
const module = await WebAssembly.instantiate(bytes.buffer, {});
export const wasmBinary = bytes.buffer
export default module.instance.exports
```

Which means that you can use AS files like this :

```typescript
// file: add.as
//@ts-ignore
export function add(a: i32, b: i32): i32 {
  return a + b;
}
```

```javascript
  import wasmAdd from './add.as'
  console.log(wasmAdd.add(2, 3))
```