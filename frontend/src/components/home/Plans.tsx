"use client";

import { useGetAllPlanQuery } from "@/redux/features/plan/plan.api";
import PlanCard from "../plan/PlanCard";
const Plans = () => {
  const { data } = useGetAllPlanQuery(undefined);

  return (
    <div className="h-screen py-[50px]">
      <div className="flex justify-start items-center gap-[10px] py-[20px]">
        {data?.data?.map((data) => (
          <PlanCard plan={data} key={data._id} />
        ))}
      </div>
    </div>
  );
};

export default Plans;
