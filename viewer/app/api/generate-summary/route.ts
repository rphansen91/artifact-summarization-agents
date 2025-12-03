import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { weekPath } = await request.json();

    if (!weekPath) {
      return NextResponse.json(
        { error: 'Week path is required' },
        { status: 400 }
      );
    }

    // Call the workflow endpoint
    const workflowResponse = await fetch('http://localhost:6700/api/workflows/weekSummaryWorkflow/start-async', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputData: {
          weekPath: weekPath
        }
      }),
    });

    if (!workflowResponse.ok) {
      throw new Error(`Workflow failed: ${workflowResponse.statusText}`);
    }

    const workflowResult = await workflowResponse.json();

    return NextResponse.json({
      success: true,
      workflowResult
    });

  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}