# Using FBX Models with the 3D Product Configurator

This guide explains how to use FBX models with the 3D Product Configurator.

## FBX Model Requirements

1. Your FBX model should have properly named meshes that can be referenced in the configuration.
2. Each configurable part should be a separate mesh with a unique name.
3. The model should be properly scaled and centered.
4. Textures should be embedded or provided separately.

## Configuration Structure

The configuration for an FBX model follows the same structure as GLB/GLTF models:

```json
{
  "name": "Your Product Name",
  "description": "Product description",
  "envMap": "/envmaps/room1.hdr",
  "model": "/products/your_product/model.fbx",
  "nodes": [
    {
      "id": "part_name",
      "label": "Part Display Name",
      "defaultMesh": "mesh_name_in_fbx",
      "defaultMaterial": {
        "name": "Material Name",
        "path": "/materials/material_folder/index.json"
      },
      "candidateMeshes": [
        {
          "id": "mesh_name_in_fbx",
          "label": "Mesh Display Name"
        }
      ],
      "candidateMaterials": [
        {
          "name": "Material Name",
          "thumbnail": "/materials/material_folder/preview.jpg",
          "path": "/materials/material_folder/index.json"
        }
      ]
    }
  ]
}
```

## Adding a New FBX Product

1. Create a new folder in `public/products/` for your product
2. Place your FBX model in this folder
3. Create an `index.json` file with the configuration
4. Add your product to `public/products/products.json`

## Mesh Names

Make sure the mesh names in your FBX file match the `id` values in the `candidateMeshes` array. The configurator uses these names to find and manipulate the meshes in the model.

## Materials

Materials work the same way as with GLB/GLTF models. You can use any of the existing materials or create new ones. 