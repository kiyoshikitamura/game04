import { notFound } from 'next/navigation';
import DeviceDebugFixture from './DeviceDebugFixture';
export default function Page() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <DeviceDebugFixture />;
}
