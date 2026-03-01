import { NextRequest, NextResponse } from 'next/server';
import { Activity } from '@/types/activity';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'activities.json');

async function readActivities(): Promise<Activity[]> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeActivities(activities: Activity[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(activities, null, 2), 'utf-8');
}

export async function GET() {
  const activities = await readActivities();
  return NextResponse.json({ activities });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tanggal, namaKegiatan, keterangan, foto } = body;
    const newActivity: Activity = {
      id: Date.now().toString(),
      tanggal,
      namaKegiatan,
      keterangan,
      foto,
      createdAt: Date.now(),
    };
    const activities = await readActivities();
    activities.push(newActivity);
    await writeActivities(activities);
    return NextResponse.json({ success: true, activity: newActivity });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create activity' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    const body = await request.json();
    let updatedActivity: Activity | undefined = undefined;
    let activities = await readActivities();
    let found = false;
    activities = activities.map((activity) => {
      if (activity.id === id) {
        found = true;
        const updated = {
          ...activity,
          ...body,
          id: activity.id,
          createdAt: activity.createdAt,
        };
        updatedActivity = updated;
        return updated;
      }
      return activity;
    }) as Activity[];
    if (!found || !updatedActivity) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
    }
    await writeActivities(activities);
    return NextResponse.json({ success: true, activity: updatedActivity });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update activity' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    let activities = await readActivities();
    activities = activities.filter(activity => activity.id !== id);
    await writeActivities(activities);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete activity' }, { status: 500 });
  }
}
