export interface CreateGroupStudentInput {
    student_id: number,
    group_id: number,
    incident_count: number,
}

export interface getGroupStudentsOutput {
    first_name: string,
    last_name: string,
    full_name: string
}