import {notFound} from 'next/navigation';
import Samples from './Samples';
export default function Page(){if(process.env.NODE_ENV!=='development')notFound();return <Samples/>;}
