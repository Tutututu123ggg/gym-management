// app/plans/page.tsx
import { getPlans } from '@/actions/customer/plans'; // Đảm bảo import đúng đường dẫn
import PlansClient from '@/components/customer/plans/PlansClient';

export default async function PlansPage() {
  const allPlans = await getPlans();
  
  // Debug log trên server terminal (VS Code terminal)
  console.log("Server fetched plans:", allPlans); 

  return (
    <PlansClient allPlans={allPlans} />
  );
}