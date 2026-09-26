import type {ReactNode} from 'react';
import './product-row.css';
export default function ProductRow({icon,name,description,condition,action}: {icon?:ReactNode;name:ReactNode;description?:ReactNode;condition?:ReactNode;action:ReactNode}) {
  return <article className="g4-product-row"><div className="g4-product-icon">{icon}</div><div className="g4-product-copy"><h3>{name}</h3>{condition&&<p>{condition}</p>}</div><div className="g4-product-action">{action}</div>{description&&<div className="g4-product-description">{description}</div>}</article>;
}
