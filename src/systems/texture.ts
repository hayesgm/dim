import { MeshStandardMaterial, Texture, TextureLoader, Vector2 } from 'three';

interface PathSet {
  color: string;
  displacement: string;
  normal: string;
  roughness: string;
  ao: string;
}

interface TextureSet {
  color: Texture;
  displacement: Texture;
  normal: Texture;
  roughness: Texture;
  ao: Texture;
}

interface TextureOpts {
  wrapS?: number,
  wrapT?: number,
  repeat?: Vector2,
}

type Ext = 'mr' | 'ue';

function getExtPaths(base: string, ext: Ext): PathSet {
  if (ext === 'mr') {
    return {
      color: `${base}_BaseColor.png`,
      displacement: `${base}_Height.png`,
      normal: `${base}_Normal.png`,
      roughness: `${base}_Roughness.png`,
      ao: `${base}_AO.png`,
    }
  } else if (ext === 'ue') {
    return {
      color: `${base}-albedo3.png`,
      displacement: `${base}-height.png`,
      normal: `${base}-normal1-dx.png`,
      roughness: `${base}-rough.png`,
      ao: `${base}-ao.png`,
    }
  } else {
    throw new Error(`Unknown Ext type: ${ext}`);
  }
}

export async function loadTexture(
  base: string,
  ext: Ext = 'mr',
  textureOpts: TextureOpts = {},
): Promise<TextureSet> {
  let loader = new TextureLoader();
  let paths = getExtPaths(base, ext);
  let textures = await Promise.all([
    loader.load(paths.color),
    loader.load(paths.displacement),
    loader.load(paths.normal),
    loader.load(paths.roughness),
    loader.load(paths.ao),
  ]);

  if (textureOpts.wrapS) {
    textures.forEach((texture) => texture.wrapS = textureOpts.wrapS!);
  }
  if (textureOpts.wrapT) {
    textures.forEach((texture) => texture.wrapT = textureOpts.wrapT!);
  }
  if (textureOpts.repeat) {
    textures.forEach((texture) => texture.repeat = textureOpts.repeat!);
  }

  let [color, displacement, normal, roughness, ao] = textures;
  return { color, displacement, normal, roughness, ao };
}

export async function loadMeshStandardMaterial(
  base: string,
  ext: Ext = 'mr',
  textureOpts: TextureOpts = {},
): Promise<MeshStandardMaterial> {
  let { color, displacement, normal, roughness, ao } = await loadTexture(base, ext, textureOpts);

  // TODO: envMap?
  return new MeshStandardMaterial({
    map: color,
    // displacementMap: displacement, // TODO: This maybe needs to be scaled
    normalMap: normal,
    roughnessMap: roughness,
    aoMap: ao,
  });
}
