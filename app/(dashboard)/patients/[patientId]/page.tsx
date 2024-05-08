import PatientForm from "@/app/(dashboard)/patients/[patientId]/components/patientForm";

const PatientsPage = () => {
    return (
        <div className='flex-col'>
            <div className='flex-1 space-y-4 p-8 pt-6'  >
                <PatientForm/>
            </div>
        </div>

    )
}

export default PatientsPage;
