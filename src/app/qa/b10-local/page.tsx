import {notFound} from 'next/navigation';
import Harness from './Harness';
/** Isolated synthetic save; available only to local and Preview verification. */
export default function Page(){if(process.env.NODE_ENV!=='development'&&process.env.VERCEL_ENV!=='preview')notFound();return <Harness/>;}
