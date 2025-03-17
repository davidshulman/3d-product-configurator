## 3D Product Configurator

## Live site
[https://3d-product-configurator.vercel.app/](https://3d-product-configurator.vercel.app/)

## Screenshot
![](https://github.com/belopot/3d-product-configurator/blob/master/screenshots/image1.jpg)

https://user-images.githubusercontent.com/46432435/229830235-b14330ce-c47c-4d05-8074-119891ccb7b8.mp4

## Features

- 3D product visualization and customization
- Material and texture swapping
- Part replacement
- Supports GLB/GLTF and FBX models
- Environment mapping
- Realistic lighting and shadows
- Responsive design

## FBX Support

This version includes support for FBX models. To use FBX models:

1. Place your FBX model in a product folder
2. Configure the product in the index.json file
3. Add the product to the products.json list

For detailed instructions, see the [FBX Guide](public/products/fbx_sample/README.md).

## Install

Assumes you already have `node` installed. If you already have `yarn` installed you can skip the next command.

    npm install --global yarn

Install all dependencies for node

    yarn install

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.\
The page will reload if you make edits.

### `yarn build`

Builds the app for production to the `build` folder.

### `yarn lint`

Run prettier check only

### `yarn fix`

Run prettier with `-fix` (modifies files)

---
