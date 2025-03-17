import {Paper} from "@material-ui/core"
import React from "react"
import styled from 'styled-components';
import DracoSelector from "../components/DracoSelector"
import MaterialSelector from "../components/MaterialSelector"
import MeshSelector from "../components/MeshSelector"
import NodeSelector from "../components/NodeSelector"
import ProductSelector from "../components/ProductSelector"
import Viewer3D from "../components/Viewer3D"
import MaterialSettings from "../components/MaterialSettings/MaterialSettings"

export default function Home() {
  return (
    <MainContainer>
      <StyledPaper>
        <ProductSelector />
        <DracoSelector />
        <NodeSelector />
        <MeshSelector />
      </StyledPaper>
      <MaterialSettingHolder>
        <MaterialSettings />
      </MaterialSettingHolder>
      <MaterialSelectHolder>
        <MaterialSelector />
      </MaterialSelectHolder>
      <ViewerContainer>
        <Viewer3D />
      </ViewerContainer>
    </MainContainer>
  )
}

const MainContainer = styled.div`
  position: relative;
  width: 100%;
  height: calc(100vh - 64px); /* Subtract header height */
  overflow: hidden;
`

const ViewerContainer = styled.div`
  width: 100%;
  height: 100%;
`

const StyledPaper = styled(Paper)`
  padding: 0.5em;
  position: absolute;
  top: 1em;
  left: 1em;
  z-index: 1;
  width: min-content;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-top: 4px solid #2e7d32; /* Add green accent */
`

const MaterialSettingHolder = styled.div`
  padding: 1em;
  position: absolute;
  top: 1em;
  right: 2em;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-top: 4px solid #2e7d32; /* Add green accent */
`

const MaterialSelectHolder = styled.div`
  padding: 0.5em;
  position: absolute;
  bottom: 1em;
  left: 1em;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-top: 4px solid #2e7d32; /* Add green accent */
`