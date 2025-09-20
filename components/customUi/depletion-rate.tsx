import {AlertTriangle, CheckCircle, Info} from "lucide-react";
import {Progress} from "@/components/ui/progress";
import { cn } from "@/lib/utils"

interface DepletionProps {
    notifiedCount: number
    declinedCount: number
    acceptedCount: number
}

const DepletionRate = ({
    notifiedCount,
    declinedCount,
    acceptedCount
}: DepletionProps) => {

    const depletionRate = notifiedCount > 0 ? Math.round((declinedCount /notifiedCount) * 100) : 0

    // Determine the severity level for styling
    const getProgressClassName = () => {
        if (acceptedCount && acceptedCount > 0) {
            return "[&>*]:bg-green-500"; // Already accepted, no concern
        }
        if (depletionRate >= 80) {
            return "[&>*]:bg-red-500/70"; // Critical - most have declined
        }
        if (depletionRate >= 50) {
            return "[&>*]:bg-orange-500/70"; // Warning - half have declined
        }
        if (depletionRate >= 25) {
            return "[&>*]:bg-yellow-500/70"; // Caution - some have declined
        }
        return "[&>*]:bg-blue-500/70"; // Good - few or none have declined
    };

    const getStatusMessage = () => {
        if (acceptedCount && acceptedCount > 0) {
            return {
                text: "Appointment Accepted",
                icon: <CheckCircle className="h-4 w-4 text-green-600" />,
                subtext: "An interpreter has accepted this appointment"
            };
        }
        if (depletionRate >= 100) {
            return {
                text: "All Declined",
                icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
                subtext: "All notified interpreters have declined"
            };
        }
        if (depletionRate >= 80) {
            return {
                text: "Critical",
                icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
                subtext: `${declinedCount} of ${notifiedCount} have declined`
            };
        }
        if (depletionRate >= 50) {
            return {
                text: "Warning",
                icon: <AlertTriangle className="h-4 w-4 text-orange-600" />,
                subtext: `${declinedCount} of ${notifiedCount} have declined`
            };
        }
        if (depletionRate >= 25) {
            return {
                text: "Moderate",
                icon: <Info className="h-4 w-4 text-yellow-600" />,
                subtext: `${declinedCount} of ${notifiedCount} have declined`
            };
        }
        return {
            text: "Healthy",
            icon: <Info className="h-4 w-4 text-blue-600" />,
            subtext: `${notifiedCount - declinedCount} interpreters still considering`
        };
    };

    const status = getStatusMessage();

    const progressValue = acceptedCount && acceptedCount > 0 ? 100 : depletionRate;

    return(
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {status.icon}
                    <div>
                        <p className="text-sm font-medium">{status.text}</p>
                        <p className="text-xs text-muted-foreground">{status.subtext}</p>
                    </div>
                </div>
                <span className="text-sm font-bold">
                    {acceptedCount && acceptedCount > 0 ? "✓" : `${depletionRate}%`}
                </span>
            </div>
            <Progress
                value={progressValue}
                className={cn("h-3 w-60", getProgressClassName())}
                // You might need to add custom styling to change the bar color
                // based on the severity. This depends on your Progress component implementation
            />
        </div>
    )

}

export default DepletionRate