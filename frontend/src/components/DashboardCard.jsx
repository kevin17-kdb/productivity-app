function DashboardCard({ title, value, icon }) {

    return (

        <div className="bg-slate-800 rounded-xl p-6 shadow-lg hover:scale-105 transition duration-300">

            <div className="flex items-center gap-3 text-2xl">

                <span>{icon}</span>

                <span className="text-gray-300 font-medium">

                    {title}

                </span>

            </div>

            <h1 className="text-5xl font-bold mt-8">

                {value}

            </h1>

        </div>

    );

}

export default DashboardCard;