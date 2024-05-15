import PatientsClient from "@/app/(dashboard)/patients/components/client";
import {usePatients} from "@/hooks/patients";



const PatientsPage = async () => {
    //use the hook to get the data from the server



    return (
        <div className='flex-col'>
            <div className='flex-1 px-4 '>
                <PatientsClient/>
            </div>
        </div>


    );
}
export default PatientsPage;