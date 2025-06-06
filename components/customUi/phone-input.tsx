//phone input uses pattern format from react-number-format to format the phone number input. On the client the props are used to
//determine the format and placeholder for the phone number input. The phone number input is used in the forms to format the phone number input.

import { PatternFormat } from 'react-number-format';

type Props = {
    format: string;
    allowEmptyFormatting: boolean
    mask: string
    value: string
    onChange: (value: string) => void
}

export const PhoneInput = ({
    format,
    allowEmptyFormatting,
    mask,
    value,
    onChange
}: Props
) => {

    return (
        <PatternFormat
            format={format}
            value={value}
            onValueChange={({ value }) => onChange(value)}
            allowEmptyFormatting = {allowEmptyFormatting}
            mask={mask}
            className='flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        />
    )
}