
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RecentActivity = () => {
  // Mock data for recent activity
  const activities = [
    { id: 1, type: "call", contact: "John Doe", time: "2 hours ago" },
    { id: 2, type: "email", contact: "Jane Smith", time: "Yesterday" },
    { id: 3, type: "meeting", contact: "Peter Jones", time: "3 days ago" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <li key={activity.id} className="py-2">
              <div className="flex space-x-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{activity.contact}</h3>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {activity.type === "call" && "Made a call to"}
                    {activity.type === "email" && "Sent an email to"}
                    {activity.type === "meeting" && "Had a meeting with"}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
