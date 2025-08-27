
import { headers } from 'next/headers';
import LandingPageDesigned from "./landing_page_designed";
import LandingPageMobile from "./landing_page_mobile";

export default async function Home() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // Detect mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  if (isMobile) {
    return <LandingPageMobile />;
  }
  
  return <LandingPageDesigned />;
}
