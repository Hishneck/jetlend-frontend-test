import { aggregatedUserData } from '../components/processor';
import { test, expect } from '@jest/globals'


test('aggregates user data correctly', () => {
    const result = aggregatedUserData(
        [{ id: 1, name: 'Project A', code: 'A' }],
        { status: 'OK', data: [{ id: 1, name: 'User 1' }] },
        { status: 'OK', data: [{ id: 1, name: 'Task 1', project_id: 1, estimate: 5, responsible_id: 1 }] }
    );

    console.log('result:', JSON.stringify(result, null, 2));

    expect(result).toEqual([
        {
            name: 'User 1',
            total_estimate: 5,
            projects_estimates: [
                {
                    name: 'Project A',
                    total_estimate: 5,
                    tasks: [{ id: 1, name: 'Task 1', estimate: 5 }]
                }
            ]
        }
    ]);
});