'use client'

import {Heading} from "@/components/customUi/heading";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import HeadingContainer from "@/components/customUi/headingContainer";

const PatientsClient = () => {
  return (
      <>
          <HeadingContainer>
              <Heading
                  title={"Patients"}
                  description={"List of all patients"}
              />
              <Button
                className='items-center'
              >
                  <span className="font-bold pr-1 text-lg">+</span>
                  Patient
              </Button>
          </HeadingContainer>
          <Separator />

      </>
  )
}

export default PatientsClient;

