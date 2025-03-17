import {
  CURRENT_DRACO_VERSION,
  GET_CURRENT_PRODUCT_DATA,
  GET_PRODUCT_DATA_LIST,
  SET_CURRENT_PRODUCT_DATA
} from "../StoreConstants"

export function getCurrentProductData(path) {
  return dispatch => {
    console.log('Getting product data from path:', path);
    if (path) {
      fetch(path)
        .then(response => {
          console.log('Product data fetch response:', response.status, response.statusText);
          return response.json();
        })
        .then(data => {
          console.log('Product data loaded:', data);
          dispatch({
            type: GET_CURRENT_PRODUCT_DATA,
            payload: data
          })
        })
        .catch(error => {
          console.error('Error loading product data:', error);
        });
    } else {
      dispatch({
        type: GET_CURRENT_PRODUCT_DATA,
        payload: null
      })
    }
  }
}

export function getProductDataList() {
  return dispatch => {
    console.log('Fetching products list from products.json');
    fetch("/products/products.json")
      .then(response => {
        console.log('Products list response:', response.status, response.statusText);
        return response.json();
      })
      .then(data => {
        console.log('Products list loaded:', data);
        dispatch({
          type: GET_PRODUCT_DATA_LIST,
          payload: data
        })

        if(data.length > 0) {
          console.log('Setting initial product to:', data[0]);
          dispatch({
            type: SET_CURRENT_PRODUCT_DATA,
            payload: data[0]
          })      
        }
      })
      .catch(error => {
        console.error('Error loading products list:', error);
      });
  }
}

export function setCurrentProductData(data) {
  return dispatch => {
    dispatch({
      type: SET_CURRENT_PRODUCT_DATA,
      payload: data
    })
  }
}

export function setCurrentDracoVersion(data) {
  return dispatch => {
    dispatch({
      type: CURRENT_DRACO_VERSION,
      payload: data
    })
  }
}
