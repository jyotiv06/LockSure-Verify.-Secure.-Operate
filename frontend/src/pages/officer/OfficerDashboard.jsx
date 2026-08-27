import {
    Activity,
    CheckCircle2,
    Clock3,
    ShieldAlert,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import OfficerLayout from "../../components/officer/OfficerLayout";
import StatCard from "../../components/officer/StatCard";
import SecurityOverview from "../../components/officer/SecurityOverview";
import QuickActions from "../../components/officer/QuickActions";
import RecentOperations from "../../components/officer/RecentOperations";
function OfficerDashboard() {
    const navigate = useNavigate();
    return (
        <OfficerLayout>

            {/* Page Header */}
            <div className="mb-7">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
                            Operations Center
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
                            Officer Dashboard
                        </h1>

                        <p className="mt-2 text-sm text-[#64748B]">
                            Monitor locker operations, customer verification and security activity.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2">
                        <Activity
                            size={16}
                            className="text-[#10B981]"
                        />

                        <span className="text-xs font-semibold text-[#047857]">
                            All systems operational
                        </span>
                    </div>

                </div>

            </div>

            {/* Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    title="Total Locker Operations"
                    value="128"
                    description="+12.4% this week"
                    icon={Activity}
                    variant="blue"
                />

                <StatCard
                    title="Successful"
                    value="104"
                    description="81.2% success rate"
                    icon={CheckCircle2}
                    variant="green"
                />

                <StatCard
                    title="Pending"
                    value="16"
                    description="Awaiting officer review"
                    icon={Clock3}
                    variant="amber"
                />

                <StatCard
                    title="High Risk"
                    value="8"
                    description="Requires immediate attention"
                    icon={ShieldAlert}
                    variant="red"
                />

            </div>

            {/* Security + Actions */}
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">

                <SecurityOverview />

                <QuickActions />

            </div>

            {/* Recent Operations */}
            <div className="mt-6">

                <RecentOperations />

            </div>

        </OfficerLayout>
    );
}

export default OfficerDashboard;