import {
  useParams
} from 'react-router-dom';

function ProductDetail() {
  const { productId } = useParams();
  return (
    <>
      <h3>产品详情 {productId}</h3>
    </>
  )
}

export default ProductDetail;