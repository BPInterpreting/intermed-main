import AppointmentsClient from "@/app/(dashboard)/appointments/components/client";
import FacilitiesClient from "@/app/(dashboard)/facilities/components/client";

const FacilitiesPage = () => {
  return (
      <div className='flex-col'>
          <div className='flex-1 px-4'>
              <FacilitiesClient />
          </div>
      </div>
  )
}

export default FacilitiesPage;
