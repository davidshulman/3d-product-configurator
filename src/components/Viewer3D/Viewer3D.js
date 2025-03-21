import {useEffect, useRef, useState} from "react"
import {connect} from "react-redux"
import {PropTypes} from "prop-types"
import ToggleDisplay from "react-toggle-display"
import * as THREE from "three"
import * as POSTPROCESSING from "postprocessing"
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader"
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader"
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader"
import {PMREMGenerator} from "three/src/extras/PMREMGenerator"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import Loader from "../Loader"
import styles from "./Viewer3D.module.css"
import Composer from "./libs/Composer"
import Lights from "./libs/Lights"
import {FitCameraToSelection, ShadowPlane} from "./libs/Helpers"
import {SPACE_SIZE} from "./Viewer3DConstants"
import {setSelectedMeshData} from "../../redux/actions/MeshActions"
import {setSelectedMeshMaterial} from "../../redux/actions/MaterialActions"
import {setCurrentNodeData} from "../../redux/actions/NodeActions"

let g_model_root
let g_scene
let g_camera
let g_camera_controller
let g_render
let g_render_scene
let g_selected_node
let g_gltf_loader
let g_fbx_loader
let g_texture_loader
let g_rgbe_loader
let g_is_load_model = false

function Viewer3D(props) {
  const {
    materialStore,
    meshStore,
    nodeStore,
    productStore,
    setSelectedMeshData,
    setSelectedMeshMaterial,
    setCurrentNodeData
  } = props
  const canvasContainer = useRef(null)
  const [showLoader, setShowLoader] = useState(true)

  // Helper function to find a mesh by name in an FBX model
  function findMeshByName(fbxModel, meshName) {
    let foundMesh = null;
    fbxModel.traverse(child => {
      if (child.isMesh && child.name === meshName) {
        foundMesh = child;
      }
    });
    return foundMesh;
  }

  function setNodeMaterial(node, materialData) {
    if (node && materialData) {
      node.material.name = materialData.name

      //Color
      if (materialData.color === "") {
        node.material.color.set(null)
      } else {
        node.material.color.set(materialData.color)
      }

      //Albedo
      if (materialData.map === "") {
        node.material.map = null
      } else {
        const texture = g_texture_loader.load(materialData.map)
        if (materialData.uvScale) {
          texture.repeat.set(materialData.uvScale.u, materialData.uvScale.v)
          texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
        }
        node.material.map = texture
      }

      //Normal
      if (materialData.normalMap === "") {
        node.material.normalMap = null
      } else {
        const texture = g_texture_loader.load(materialData.normalMap)
        if (materialData.uvScale) {
          texture.repeat.set(materialData.uvScale.u, materialData.uvScale.v)
          texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
        }
        node.material.normalMap = texture

        node.material.normalScale = new THREE.Vector2(
          materialData.normalScale.x,
          materialData.normalScale.y
        )
      }

      //Bump
      if (materialData.bumpMap === "") {
        node.material.bumpMap = null
      } else {
        const texture = g_texture_loader.load(materialData.bumpMap)
        if (materialData.uvScale) {
          texture.repeat.set(materialData.uvScale.u, materialData.uvScale.v)
          texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
        }
        node.material.bumpMap = texture

        node.material.bumpScale = materialData.bumpScale
      }

      //Displacement
      if (materialData.displacementMap === "") {
        node.material.displacementMap = null
      } else {
        const texture = g_texture_loader.load(materialData.displacementMap)
        if (materialData.uvScale) {
          texture.repeat.set(materialData.uvScale.u, materialData.uvScale.v)
          texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
        }
        node.material.displacementMap = texture

        node.material.displacementScale = materialData.displacementScale
        node.material.displacementBias = materialData.displacementBias
      }

      //Roughness
      if (materialData.roughnessMap === "") {
        node.material.roughnessMap = null
      } else {
        const texture = g_texture_loader.load(materialData.roughnessMap)
        if (materialData.uvScale) {
          texture.repeat.set(materialData.uvScale.u, materialData.uvScale.v)
          texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
        }
        node.material.roughnessMap = texture
      }

      node.material.roughness = materialData.roughness

      //Metalness
      if (materialData.metalnessMap !== "") {
        node.material.metalnessMap = null
      } else {
        const texture = g_texture_loader.load(materialData.metalnessMap)
        if (materialData.uvScale) {
          texture.repeat.set(materialData.uvScale.u, materialData.uvScale.v)
          texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
        }
        node.material.metalnessMap = texture
      }

      node.material.metalness = materialData.metalness

      //Alpha
      if (materialData.alphaMap === "") {
        node.material.alphaMap = null
      } else {
        const texture = g_texture_loader.load(materialData.alphaMap)
        if (materialData.uvScale) {
          texture.repeat.set(materialData.uvScale.u, materialData.uvScale.v)
          texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
        }
        node.material.alphaMap = texture
      }

      node.material.opacity = materialData.opacity

      //AO
      if (materialData.aoMap === "") {
        node.material.aoMap = null
      } else {
        const texture = g_texture_loader.load(materialData.aoMap)
        if (materialData.uvScale) {
          texture.repeat.set(materialData.uvScale.u, materialData.uvScale.v)
          texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
        }
        node.material.aoMap = texture

        node.material.aoMapIntensity = materialData.aoMapIntensity
      }

      //Emissive
      if (materialData.emissiveMap === "") {
        node.material.emissiveMap = null
      } else {
        const texture = g_texture_loader.load(materialData.emissiveMap)
        if (materialData.uvScale) {
          texture.repeat.set(materialData.uvScale.u, materialData.uvScale.v)
          texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
        }
        node.material.emissiveMap = texture

        node.material.emissiveIntensity = materialData.emissiveIntensity
      }
      node.material.emissive.set(materialData.emissive)

      //Env
      node.material.envMapIntensity = materialData.envMapIntensity

      node.material.wireframe = materialData.wireframe
      node.material.transparent = materialData.transparent
      node.material.needsUpdate = true

      //Set material to candidate meshes
      node.children.forEach(child => {
        child.material = node.material
      })
    }
  }

  async function fetchMaterialData(path) {
    const response = await fetch(path)
    const data = await response.json()
    return data
  }

  useEffect(() => {
    let width = canvasContainer.current.offsetWidth
    let height = canvasContainer.current.offsetHeight

    let renderRequested = false

    let smaaSearchImage = null
    let smaaAreaImage = null

    const clock = new THREE.Clock()

    let composer = null

    g_model_root = new THREE.Object3D()
    g_model_root.name = "ModelRoot"

    const rayCaster = new THREE.Raycaster()
    const intersects = []

    /**
     * Scene
     */
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#aeaeae")
    // scene.fog = new THREE.Fog(0xa0a0a0, SPACE_SIZE * 0.9, SPACE_SIZE)
    g_scene = scene

    scene.add(g_model_root)

    /**
     * Lighter
     */
    const lighter = Lights()
    scene.add(lighter)

    /**
     * Helper
     */
    // const axisHelper = new THREE.AxesHelper(5)
    // scene.add(axisHelper)

    const shadowPlane = ShadowPlane()
    scene.add(shadowPlane)
    /**
     * Camera
     */
    const camera = new THREE.PerspectiveCamera(
      30,
      width / height,
      0.01,
      SPACE_SIZE * 100
    )
    camera.position.set(-SPACE_SIZE * 0.2, SPACE_SIZE, SPACE_SIZE)
    camera.lookAt(0, 0, 0)
    g_camera = camera

    /**
     * Resize & Render
     */
    function resizeRendererToDisplaySize() {
      const canvasWidth = renderer.domElement.offsetWidth
      const canvasHeight = renderer.domElement.offsetHeight
      const needResize = canvasWidth !== width || canvasHeight !== height
      if (needResize) {
        width = canvasWidth
        height = canvasHeight
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
        composer.setSize(width, height)
        requestRenderIfNotRequested()
      }
    }

    function requestRenderIfNotRequested() {
      if (!renderRequested) {
        renderRequested = true
        requestAnimationFrame(render)
      }
    }

    function render() {
      renderRequested = false
      
      // Make sure the renderer size matches the canvas
      resizeRendererToDisplaySize()
      
      // Update controls 
      cameraController.update();

      // Only use composer if it's been initialized
      if (composer) {
        composer.render(clock.getDelta())
      } else {
        renderer.render(scene, camera)
      }
    }

    g_render_scene = () => {
      render();
    }

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false
    })
    renderer.setSize(width, height, false)
    renderer.setPixelRatio(window.devicePixelRatio || 1)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    g_render = renderer

    canvasContainer.current.appendChild(renderer.domElement)

    //Mouse&Touch event
    function onMouseDown(event) {}
    function onMouseUp(event) {
      const pickedPoint = new THREE.Vector2(
        (event.offsetX / width) * 2 - 1,
        -(event.offsetY / height) * 2 + 1
      )
      rayCaster.setFromCamera(pickedPoint, camera)
      let pickedObjs = rayCaster.intersectObjects(intersects)
      if (pickedObjs.length > 0) {
      }
    }
    function onMouseMove(event) {
      const pickedPoint = new THREE.Vector2(
        (event.offsetX / width) * 2 - 1,
        -(event.offsetY / height) * 2 + 1
      )

      rayCaster.setFromCamera(pickedPoint, camera)
      let pickedObjs = rayCaster.intersectObjects(intersects)
      if (pickedObjs.length > 0) {
        document.body.style.cursor = "pointer"
      } else {
        document.body.style.cursor = "default"
      }
    }

    function onTouchStart(event) {}
    function onTouchEnd(event) {
      const pickedPoint = new THREE.Vector2(
        (event.changedTouches[0].pageX / width) * 2 - 1,
        -(event.changedTouches[0].pageY / height) * 2 + 1
      )
      rayCaster.setFromCamera(pickedPoint, camera)
      let pickedObjs = rayCaster.intersectObjects(intersects)
      if (pickedObjs.length > 0) {
      }
    }
    function onTouchMove() {}

    renderer.domElement.addEventListener("mousedown", onMouseDown)
    renderer.domElement.addEventListener("mouseup", onMouseUp)
    renderer.domElement.addEventListener("mousemove", onMouseMove)

    renderer.domElement.addEventListener("touchstart", onTouchStart)
    renderer.domElement.addEventListener("touchend", onTouchEnd)
    renderer.domElement.addEventListener("touchmove", onTouchMove)

    /**
     * Camera Controller
     */
    const cameraController = new OrbitControls(camera, renderer.domElement)
    cameraController.minAzimuthAngle = -180
    cameraController.maxAzimuthAngle = 180
    cameraController.dampingFactor = 0.05
    cameraController.screenSpacePanning = true
    // cameraController.minDistance = 1
    // cameraController.maxDistance = 500
    // cameraController.minZoom = 1
    // cameraController.maxZoom = 500
    cameraController.minPolarAngle = 1
    cameraController.maxPolarAngle = Math.PI / 1.5
    cameraController.enableDamping = true
    cameraController.enableZoom = true
    cameraController.enablePan = false
    
    // Ensure the controller is active and takes precedence
    cameraController.enabled = true;
    cameraController.update();
    
    g_camera_controller = cameraController

    /**
     * Load Assets
     */
    const gltfLoadingManager = new THREE.LoadingManager()
    gltfLoadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      setShowLoader(true)
    }
    gltfLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (!showLoader) {
        setShowLoader(true)
      }
    }
    gltfLoadingManager.onLoad = () => {
      if (g_is_load_model) {
        camera.position.set(-SPACE_SIZE * 0.2, SPACE_SIZE, SPACE_SIZE)
        camera.lookAt(0, 0, 0)
          
        // Keep the basic fit
        FitCameraToSelection(camera, g_model_root, 6, cameraController)
        g_is_load_model = false
      }
      requestRenderIfNotRequested()
      setTimeout(() => {
        setShowLoader(false)
      }, 1200)
    }
    const gLTFLoader = new GLTFLoader(gltfLoadingManager)
    g_gltf_loader = gLTFLoader

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath("/draco/")
    gLTFLoader.setDRACOLoader(dracoLoader)

    const textureLoader = new THREE.TextureLoader(gltfLoadingManager)
    g_texture_loader = textureLoader

    // Initialize FBX loader
    const fbxLoader = new FBXLoader(gltfLoadingManager)
    g_fbx_loader = fbxLoader

    //Load smaa images
    const smaaImageLoader = new POSTPROCESSING.SMAAImageLoader(
      gltfLoadingManager
    )
    smaaImageLoader.load(([search, area]) => {
      smaaSearchImage = search
      smaaAreaImage = area
      composer = Composer(
        renderer,
        scene,
        camera,
        smaaSearchImage,
        smaaAreaImage
      )
    })

    //Load env map
    g_rgbe_loader = new RGBELoader(gltfLoadingManager)

    /**
     * RenderEvent & Dispose
     */
    renderer.render(scene, camera)
    cameraController.addEventListener("change", requestRenderIfNotRequested)
    window.addEventListener("resize", requestRenderIfNotRequested)
    return () => {
      cameraController.removeEventListener(
        "change",
        requestRenderIfNotRequested
      )
      window.removeEventListener("resize", requestRenderIfNotRequested)
      if (canvasContainer.current) canvasContainer.current.innerHTML = ""
    }
  }, [])

  useEffect(() => {
    setCurrentNodeData(null)

    //Set env
    if (productStore.productData) {
      g_rgbe_loader
        .setDataType(THREE.UnsignedByteType)
        .load(productStore.productData.envMap, texture => {
          const pg = new PMREMGenerator(g_render)
          pg.compileEquirectangularShader()
          const envMap = pg.fromEquirectangular(texture).texture
          g_scene.environment = envMap
          // g_scene.background = envMap
          texture.dispose()
          pg.dispose()
        })
    }

    //Clear
    g_model_root.children.forEach(node => {
      node.children.forEach(child => {
        child.geometry.dispose()
        child.material.dispose()
        node.remove(child)
      })
      g_model_root.remove(node)
    })
    g_model_root.children = []

    //Load models
    if (productStore.productData) {
      g_is_load_model = true
      
      // Check if the model is FBX or GLTF/GLB
      const modelPath = productStore.productData[productStore.currentDracoVersion] || productStore.productData.model;
      
      console.log('Product Data:', productStore.productData);
      console.log('Model Path:', modelPath);
      
      // Verify that the model file exists
      fetch(modelPath)
        .then(response => {
          console.log('Model file fetch response:', response.status, response.statusText);
          if (!response.ok) {
            throw new Error(`Model file not found: ${modelPath}`);
          }
          
          const isFBX = modelPath.toLowerCase().endsWith('.fbx');
          console.log('Loading model:', modelPath, 'isFBX:', isFBX);
          
          if (isFBX) {
            // Load FBX model
            console.log('Starting FBX loader...');
            g_fbx_loader.load(
              modelPath,
              fbx => {
                console.log('FBX loaded successfully:', fbx);
                console.log('FBX structure:', {
                  name: fbx.name,
                  type: fbx.type,
                  children: fbx.children.map(child => ({
                    name: child.name,
                    type: child.type
                  }))
                });
                
                // Scale and position the model appropriately
                // FBX models often need scaling adjustments
                fbx.scale.set(0.01, 0.01, 0.01); // Scale down by default, adjust as needed
                fbx.position.set(0, 0, 0); // Center the model
                
                // Apply shadows to all meshes
                fbx.traverse(child => {
                  if (child.isMesh) {
                    console.log('Found mesh in FBX:', {
                      name: child.name,
                      geometry: child.geometry ? {
                        vertices: child.geometry.attributes.position.count,
                        uvs: child.geometry.attributes.uv ? child.geometry.attributes.uv.count : 'none'
                      } : 'none',
                      material: child.material ? {
                        name: child.material.name,
                        type: child.material.type
                      } : 'none'
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                  }
                });
                
                // Generate the model structure
                console.log('Processing nodes from config:', productStore.productData.nodes);
                
                // Keep track of whether any meshes were added
                let meshesAdded = false;
                
                productStore.productData.nodes.forEach(node => {
                  console.log('Processing node:', node.id);
                  const pivot = new THREE.Object3D();
                  pivot.name = node.id;
                  
                  // Apply special handling for shed model
                  const isShed = modelPath.includes('shed.glb');
                  if (isShed) {
                    // No special handling per pivot - we're rotating the whole scene instead
                    console.log('Using scene-level rotation for shed model');
                  }
                  
                  // Find meshes that match the node's candidate meshes
                  node.candidateMeshes.forEach(json => {
                    const fbxMesh = findMeshByName(fbx, json.id);
                    console.log('Looking for mesh:', {
                      id: json.id,
                      found: !!fbxMesh,
                      meshDetails: fbxMesh ? {
                        name: fbxMesh.name,
                        type: fbxMesh.type
                      } : null
                    });
                    if (fbxMesh) {
                      meshesAdded = true;
                      fbxMesh.visible = fbxMesh.name === node.defaultMesh;
                      
                      // Clone the mesh to avoid reference issues
                      const clonedMesh = fbxMesh.clone();
                      
                      // Ensure the mesh has the correct name
                      clonedMesh.name = json.id;
                      
                      // Add the mesh to the pivot
                      pivot.add(clonedMesh);
                      
                      console.log('Added mesh to pivot:', {
                        pivotName: pivot.name,
                        meshName: clonedMesh.name,
                        visible: clonedMesh.visible
                      });
                    } else {
                      // If mesh not found by exact name, try a fuzzy match
                      console.log('Trying fuzzy match for mesh:', json.id);
                      let fuzzyMatch = null;
                      fbx.traverse(child => {
                        if (child.isMesh && child.name.toLowerCase().includes(json.id.toLowerCase())) {
                          fuzzyMatch = child;
                          console.log('Found fuzzy match:', child.name);
                        }
                      });
                      
                      if (fuzzyMatch) {
                        fuzzyMatch.visible = fuzzyMatch.name === node.defaultMesh;
                        const clonedMesh = fuzzyMatch.clone();
                        clonedMesh.name = json.id;
                        pivot.add(clonedMesh);
                        console.log('Added fuzzy matched mesh to pivot:', {
                          pivotName: pivot.name,
                          meshName: clonedMesh.name,
                          visible: clonedMesh.visible
                        });
                      }
                    }
                  });
                  
                  g_model_root.add(pivot);
                });
                
                // If no meshes were added based on the configuration, add all meshes as a fallback
                if (!meshesAdded) {
                  console.log('No meshes matched configuration. Adding all meshes as fallback...');
                  
                  // Create a default pivot
                  const defaultPivot = new THREE.Object3D();
                  defaultPivot.name = productStore.productData.nodes[0]?.id || 'default';
                  
                  // Apply special handling for shed model
                  const isShed = modelPath.includes('shed.glb');
                  if (isShed) {
                    console.log('Using scene-level rotation for shed model');
                  }
                  
                  // Add all meshes to the default pivot
                  fbx.traverse(child => {
                    if (child.isMesh) {
                      console.log('Adding fallback mesh:', child.name);
                      const clonedMesh = child.clone();
                      defaultPivot.add(clonedMesh);
                    }
                  });
                  
                  // Add the default pivot to the model root
                  g_model_root.add(defaultPivot);
                  
                  // Create a default mesh data entry
                  const defaultMeshData = [{
                    nodeId: 'default',
                    meshId: 'default'
                  }];
                  
                  console.log('Setting default mesh data:', defaultMeshData);
                  setSelectedMeshData(defaultMeshData);
                }
                
                // Set data for selected mesh
                const meshData = [];
                productStore.productData.nodes.forEach(node => {
                  meshData.push({nodeId: node.id, meshId: node.defaultMesh});
                });
                console.log('Setting mesh data:', meshData);
                
                // Only set mesh data if we didn't use the fallback
                if (meshesAdded) {
                  setSelectedMeshData(meshData);
                }
                
                // Make sure the model is visible in the camera view
                setTimeout(() => {
                  console.log('Adjusting camera to fit model...');
                  // Create a bounding box for the entire model
                  const box = new THREE.Box3().setFromObject(g_model_root);
                  const center = box.getCenter(new THREE.Vector3());
                  const size = box.getSize(new THREE.Vector3());
                  
                  // Get the max side of the bounding box
                  const maxSize = Math.max(size.x, size.y, size.z);
                  const fitHeightDistance = maxSize / (2 * Math.tan(Math.PI * g_camera.fov / 360));
                  const fitWidthDistance = fitHeightDistance / g_camera.aspect;
                  const distance = 1.2 * Math.max(fitHeightDistance, fitWidthDistance);
                  
                  // Set the camera position and look at the center of the model
                  g_camera.position.set(center.x, center.y, center.z + distance);
                  g_camera.lookAt(center);
                  g_camera.updateProjectionMatrix();
                  
                  // Request a render
                  g_render_scene();
                  console.log('Camera adjusted:', {
                    position: g_camera.position,
                    lookAt: center,
                    distance: distance
                  });
                }, 1000);
                
                // Set default material
                g_model_root.children.forEach(child => {
                  console.log('Setting material for node:', child.name);
                  const material = new THREE.MeshStandardMaterial({
                    color: "#363636"
                  });
                  material.envMap = g_scene.environment;
                  child.material = material;
                  
                  const materialData = productStore.productData.nodes.find(
                    node => node.id === child.name
                  )?.defaultMaterial;
                  
                  if (materialData?.path) {
                    console.log('Applying material:', {
                      node: child.name,
                      materialPath: materialData.path,
                      materialData: materialData
                    });
                    fetchMaterialData(materialData.path).then(data => {
                      setNodeMaterial(child, data);
                    });
                  }
                });
              },
              progress => {
                console.log('FBX loading progress:', {
                  loaded: progress.loaded,
                  total: progress.total,
                  percent: (progress.loaded / progress.total * 100).toFixed(2) + '%'
                });
              },
              error => {
                console.error('Error loading FBX:', error);
                console.error('Error details:', {
                  message: error.message,
                  stack: error.stack
                });
              }
            );
          } else {
            // Load GLTF/GLB model (existing code)
            console.log('Starting GLTF/GLB loader for:', modelPath);
            g_gltf_loader.load(
              modelPath,
              gltf => {
                console.log('GLB/GLTF loaded successfully:', gltf);
                if (gltf.scene) {
                  console.log('GLTF scene:', gltf.scene);
                  
                  // Check if this is the shed model and fix orientation
                  const isShed = modelPath.includes('shed.glb');
                  if (isShed) {
                    console.log('Fixing shed orientation - simplified approach');
                    
                    // We'll use a simpler approach - rotate just the scene
                    gltf.scene.rotation.x = -Math.PI / 2;
                    
                    // Set a reasonable position
                    gltf.scene.position.y = -1;
                  }
                  
                  //Get gltf mesh
                  const gltfMeshes = []
                  gltf.scene.traverse(child => {
                    if (child.type === "Mesh") {
                      console.log('Found mesh in GLB:', {
                        name: child.name,
                        type: child.type
                      });
                      child.castShadow = true
                      gltfMeshes.push(child)
                    }
                  })
                  
                  console.log('Found meshes in GLB:', gltfMeshes.map(mesh => mesh.name));
                  console.log('Configuration nodes:', productStore.productData.nodes);

                  //Generate the model structure
                  let meshesAdded = false;
                  productStore.productData.nodes.forEach(node => {
                    console.log('Processing node:', node.id);
                    const pivot = new THREE.Object3D()
                    pivot.name = node.id
                    
                    // Apply special handling for shed model
                    const isShed = modelPath.includes('shed.glb');
                    if (isShed) {
                      console.log('Using scene-level rotation for shed model');
                    }
                    
                    node.candidateMeshes.forEach(json => {
                      console.log('Looking for mesh:', json.id);
                      const gltfMesh = gltfMeshes.find(mesh => mesh.name === json.id)
                      if (gltfMesh) {
                        console.log('Found matching mesh:', gltfMesh.name);
                        gltfMesh.visible = gltfMesh.name === node.defaultMesh
                        pivot.add(gltfMesh)
                        meshesAdded = true;
                      } else {
                        console.warn('Mesh not found for:', json.id);
                      }
                    })
                    g_model_root.add(pivot)
                  })

                  // If no meshes were added based on the configuration, add all meshes as a fallback
                  if (!meshesAdded) {
                    console.log('No meshes matched configuration. Adding all meshes as fallback...');
                    
                    // Create a default pivot
                    const defaultPivot = new THREE.Object3D();
                    defaultPivot.name = productStore.productData.nodes[0]?.id || 'default';
                    
                    // Rotate the pivot if this is the shed model
                    if (modelPath.includes('shed.glb')) {
                      defaultPivot.rotation.x = -Math.PI / 2;
                    }
                    
                    // Add all meshes to the default pivot
                    gltfMeshes.forEach(mesh => {
                      console.log('Adding fallback mesh:', mesh.name);
                      mesh.visible = true;
                      defaultPivot.add(mesh);
                    });
                    
                    // Add the default pivot to the model root
                    g_model_root.add(defaultPivot);
                    
                    // Create a default mesh data entry
                    const defaultMeshData = [{
                      nodeId: defaultPivot.name,
                      meshId: gltfMeshes[0]?.name || 'default'
                    }];
                    
                    console.log('Setting default mesh data:', defaultMeshData);
                    setSelectedMeshData(defaultMeshData);
                  } else {
                    //Set data for selected mesh
                    const meshData = []
                    productStore.productData.nodes.forEach(node => {
                      meshData.push({nodeId: node.id, meshId: node.defaultMesh})
                    })
                    setSelectedMeshData(meshData)
                  }

                  //Set default material
                  g_model_root.children.forEach(child => {
                    const material = new THREE.MeshStandardMaterial({
                      color: "#363636"
                    })
                    material.envMap = g_scene.environment
                    child.material = material

                    const materialData = productStore.productData.nodes.find(
                      node => node.id === child.name
                    )?.defaultMaterial
                    fetchMaterialData(materialData?.path).then(data => {
                      setNodeMaterial(child, data)
                    })
                  })
                } else {
                  console.error('No scene found in the GLB file');
                }
              },
              progress => {
                console.log('GLB/GLTF loading progress:', {
                  loaded: progress.loaded,
                  total: progress.total,
                  percent: (progress.loaded / progress.total * 100).toFixed(2) + '%'
                });
              },
              error => {
                console.error('Error loading GLB/GLTF:', error);
                console.error('Error details:', {
                  message: error.message,
                  stack: error.stack
                });
                setShowLoader(false);
              }
            );
          }
        })
    }
    g_render_scene()
  }, [productStore.productData, productStore.currentDracoVersion])

  useEffect(() => {
    if (g_selected_node) {
      // g_selected_node.material.color.set(g_selected_node.originColor)
      g_selected_node = null
      setSelectedMeshMaterial(null)
    }
    g_model_root?.traverse(child => {
      if (
        child.type === "Object3D" &&
        child.name === nodeStore.currentNodeData?.id
      ) {
        g_selected_node = child
        setSelectedMeshMaterial(child.material.name)
        // g_selected_node.originColor = new THREE.Color(
        //   g_selected_node.material.color.r,
        //   g_selected_node.material.color.g,
        //   g_selected_node.material.color.b
        // )
        // g_selected_node.material.color.set(0xff0000)
      }
    })
    g_render_scene()
  }, [nodeStore.currentNodeData])

  useEffect(() => {
    if (g_selected_node && meshStore.selectedMeshData) {
      const d = meshStore.selectedMeshData.find(
        data => data.nodeId === g_selected_node.name
      )
      if (d) {
        g_selected_node.children.forEach(child => {
          child.visible = child.name === d.meshId
        })
      }
    }

    g_render_scene()
  }, [meshStore.selectedMeshData])

  useEffect(() => {
    setNodeMaterial(g_selected_node, materialStore.currentMaterialData)
  }, [materialStore.currentMaterialData])

  return (
    <>
      <ToggleDisplay if={showLoader}>
        <Loader />
      </ToggleDisplay>
      <div className={styles.canvasContainer} ref={canvasContainer}></div>
    </>
  )
}

const mapStateToProps = state => ({
  materialStore: state.materialStore,
  meshStore: state.meshStore,
  nodeStore: state.nodeStore,
  productStore: state.productStore,
  setSelectedMeshData: PropTypes.func.isRequired,
  setSelectedMeshMaterial: PropTypes.func.isRequired,
  setCurrentNodeData: PropTypes.func.isRequired
})

export default connect(mapStateToProps, {
  setSelectedMeshData,
  setSelectedMeshMaterial,
  setCurrentNodeData
})(Viewer3D)
