import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  Users, 
  Ticket, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  PieChart, 
  Layers, 
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { DashboardStats, EventWithStats, Registration } from '../../types/database';

interface ReportsPageProps {
  stats: DashboardStats;
  events: EventWithStats[];
  registrations: Registration[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  stats,
  events = [],
  registrations = [],
}) => {
  const [reportRange, setReportRange] = useState<'all' | 'upcoming'>('all');
  const safeEvents = Array.isArray(events) ? events : [];
  const safeRegistrations = Array.isArray(registrations) ? registrations : [];

  // Calculate breakdown by category
  const categoryStats: { [cat: string]: { events: number; registrations: number; capacity: number } } = {};
  safeEvents.forEach((ev) => {
    const cat = ev.category || 'General';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { events: 0, registrations: 0, capacity: 0 };
    }
    categoryStats[cat].events += 1;
    categoryStats[cat].registrations += ev.registered_count;
    categoryStats[cat].capacity += ev.capacity;
  });

  // Calculate total capacity
  const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = [
      'Event ID',
      'Title',
      'Category',
      'Date',
      'Time',
      'Location',
      'Status',
      'Capacity',
      'Active Registrations',
      'Available Seats',
      'Occupancy (%)',
    ];

    const rows = safeEvents.map((e) => {
      const occ = e.capacity > 0 ? Math.round((e.registered_count / e.capacity) * 100) : 0;
      return [
        e.id,
        `"${e.title.replace(/"/g, '""')}"`,
        e.category,
        e.event_date,
        e.event_time,
        `"${e.location.replace(/"/g, '""')}"`,
        e.status,
        e.capacity,
        e.registered_count,
        e.available_seats,
        occ,
      ];
    });

    const csvString = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvString);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nowshera_Events_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Report
  const handleExportJSON = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      organization: 'Nowshera Events Co.',
      summary: stats,
      totalCapacity,
      categories: categoryStats,
      events: events.map(e => ({
        id: e.id,
        title: e.title,
        category: e.category,
        date: e.event_date,
        time: e.event_time,
        location: e.location,
        status: e.status,
        capacity: e.capacity,
        registeredCount: e.registered_count,
        availableSeats: e.available_seats,
      })),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Nowshera_Events_Report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-purple-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F3FF] text-[#6D28D9] text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Executive Analytics
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-heading">
            Operational Reports &amp; Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Auditable metrics on event capacity, attendee churn rates, and category distribution in Nowshera.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#6D28D9] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            id="btn-export-json"
            onClick={handleExportJSON}
            className="px-3.5 py-2.5 bg-white border border-purple-200 hover:bg-purple-50 text-[#6D28D9] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-4 h-4" />
            <span>JSON</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition-all shadow-2xs"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Events */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100/90 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase">Total Events</div>
          <div className="text-2xl font-extrabold text-gray-900 mt-1 font-heading">{stats.totalEvents}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">{stats.publishedEvents} published</div>
        </div>

        {/* Total Registrations */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100/90 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase">Total Signups</div>
          <div className="text-2xl font-extrabold text-gray-900 mt-1 font-heading">{stats.totalRegistrations}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">All time records</div>
        </div>

        {/* Active Registrations */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100/90 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase">Active Seats</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-heading">{stats.activeRegistrations}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Confirmed passes</div>
        </div>

        {/* Cancelled Registrations */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100/90 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase">Cancelled</div>
          <div className="text-2xl font-extrabold text-rose-600 mt-1 font-heading">{stats.cancelledRegistrations}</div>
          <div className="text-[10px] text-rose-700 font-semibold mt-0.5">Seats recycled</div>
        </div>

        {/* Available Capacity */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100/90 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase">Available Seats</div>
          <div className="text-2xl font-extrabold text-[#6D28D9] mt-1 font-heading">{stats.availableSeats}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Ready for booking</div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100/90 shadow-2xs">
          <div className="text-[11px] font-bold text-gray-400 uppercase">Occupancy</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1 font-heading">{stats.occupancyRate}%</div>
          <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">Capacity filled</div>
        </div>

      </div>

      {/* Breakdown Section: Categories & Attendance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Category Breakdown Table */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-purple-100/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 font-heading">
              Category Distribution &amp; Capacity
            </h3>
            <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md">
              {Object.keys(categoryStats).length} Tracks
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-100 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-center">Events</th>
                  <th className="pb-3 text-center">Capacity</th>
                  <th className="pb-3 text-center">Registrations</th>
                  <th className="pb-3 text-right">Fill Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {Object.entries(categoryStats).map(([cat, data]) => {
                  const fill = data.capacity > 0 ? Math.round((data.registrations / data.capacity) * 100) : 0;
                  return (
                    <tr key={cat} className="py-2.5">
                      <td className="py-2.5 font-bold text-gray-800">{cat}</td>
                      <td className="py-2.5 text-center text-gray-600">{data.events}</td>
                      <td className="py-2.5 text-center text-gray-600">{data.capacity}</td>
                      <td className="py-2.5 text-center font-bold text-[#6D28D9]">{data.registrations}</td>
                      <td className="py-2.5 text-right font-bold">
                        <span className={fill >= 80 ? 'text-emerald-700' : 'text-gray-700'}>
                          {fill}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Churn and Retention Ratio Card */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-purple-100/80 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-gray-900 font-heading">
            Registration Integrity &amp; Seat Turnaround
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700">Active Retained Registrations ({stats.activeRegistrations})</span>
                <span className="text-emerald-700">
                  {stats.totalRegistrations > 0 ? Math.round((stats.activeRegistrations / stats.totalRegistrations) * 100) : 100}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${stats.totalRegistrations > 0 ? (stats.activeRegistrations / stats.totalRegistrations) * 100 : 100}%`
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-600">Cancellation &amp; Seat Recycle Rate ({stats.cancelledRegistrations})</span>
                <span className="text-rose-600">
                  {stats.totalRegistrations > 0 ? Math.round((stats.cancelledRegistrations / stats.totalRegistrations) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{
                    width: `${stats.totalRegistrations > 0 ? (stats.cancelledRegistrations / stats.totalRegistrations) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#FAF9FF] rounded-2xl border border-purple-100 text-xs text-gray-600 space-y-1">
            <div className="font-bold text-gray-900">Automatic Seat Recycling Compliance:</div>
            <p className="text-[11px] leading-relaxed">
              When an attendee cancels a seat reservation (Rule 9 &amp; 10), the capacity counter immediately recalculates and unlocks the vacancy for other attendees without manual intervention.
            </p>
          </div>
        </div>

      </div>

      {/* Detailed Operational Event Ledger */}
      <div className="bg-white rounded-3xl border border-purple-100/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-[#FAF9FF] border-b border-purple-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 font-heading">
            Comprehensive Event Performance Ledger
          </h3>
          <span className="text-xs text-gray-500">{safeEvents.length} events logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white border-b border-purple-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6">Event Title</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Capacity</th>
                <th className="py-3 px-4 text-center">Active Regs</th>
                <th className="py-3 px-4 text-center">Remaining</th>
                <th className="py-3 px-6 text-right">Occupancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {safeEvents.map((ev) => {
                const occ = ev.capacity > 0 ? Math.round((ev.registered_count / ev.capacity) * 100) : 0;
                return (
                  <tr key={ev.id} className="hover:bg-purple-50/20">
                    <td className="py-3 px-6 font-bold text-gray-900">{ev.title}</td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{ev.event_date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ev.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700 font-semibold">{ev.capacity}</td>
                    <td className="py-3 px-4 text-center text-[#6D28D9] font-bold">{ev.registered_count}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{ev.available_seats}</td>
                    <td className="py-3 px-6 text-right font-extrabold text-gray-900">{occ}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
