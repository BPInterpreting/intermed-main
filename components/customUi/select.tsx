//generic reusable select component to list and use to create new items

"use client"

import { useMemo} from "react";
import { SingleValue} from "react-select";
import CreatableSelect from "react-select/creatable";

type Props = {
    onChange: (value?: string) => void;
    onCreate?: (value: string) => void;
    options?: {label: string, value: string}[]; //exactly what is formatted in the appointment form
    value?: string | null | undefined; //the extra options are to satisfy the types
    disabled?: boolean;
    placeholder?: string;
}

export const Select = ({
    onChange,
    onCreate,
    options = [],
    value,
    disabled,
    placeholder,
}: Props) => {

    const onSelect = (
        option: SingleValue<{label: string, value: string}>
    ) => {
        onChange(option?.value)
    }

    const formattedValue = useMemo(() => {
        return options.find((option) => option.value === value)
    }, [options, value])

    return (
        <CreatableSelect
            placeholder={placeholder}
            className="text-sm h-10" //classname matches the input component
            //based on the react select api documentation for styling
            styles={{
                control: (base) => ({
                    ...base,
                    borderColor: "e2e8f0",
                    ":hover": {
                        borderColor: "e2e8f0"
                    }
                })
            }}
            value={formattedValue}
            onChange={onSelect}
            options={options}
            onCreateOption={onCreate}
            isDisabled={disabled}
        />
    )

}



