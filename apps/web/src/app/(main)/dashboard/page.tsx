"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RenterBookingsTab } from "@/components/dashboard/RenterBookingsTab";
import { OwnerBookingsTab } from "@/components/dashboard/OwnerBookingsTab";
import { MyListingsTab } from "@/components/dashboard/MyListingsTab";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">My bookings</TabsTrigger>
          <TabsTrigger value="requests">Booking requests</TabsTrigger>
          <TabsTrigger value="listings">My listings</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings">
          <RenterBookingsTab />
        </TabsContent>
        <TabsContent value="requests">
          <OwnerBookingsTab />
        </TabsContent>
        <TabsContent value="listings">
          <MyListingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
