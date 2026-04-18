declare module 'three/examples/jsm/loaders/GLTFLoader' {
  export class GLTFLoader {
    parse(
      data: ArrayBuffer,
      path: string,
      onLoad: (gltf: any) => void,
      onError?: (error: unknown) => void,
    ): void;
  }
}
