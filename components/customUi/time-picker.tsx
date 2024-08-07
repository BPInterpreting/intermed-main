import TimePicker from "react-time-picker";
import 'react-time-picker/dist/TimePicker.css';
import {className} from "postcss-selector-parser";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";


type Props = {
    value?: string;
    onChange?: (value: string | null) => void;
    disabled?: boolean;
}


export const TimePick = ({
   value,
   onChange,
   disabled
}: Props) => {
    return (
        <div>
                <TimePicker
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    autoFocus={true}
                    disableClock={true}
                />
        </div>
    )
}