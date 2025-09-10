import TimePicker from "react-time-picker";
import 'react-time-picker/dist/TimePicker.css';

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