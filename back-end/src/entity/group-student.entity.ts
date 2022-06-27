import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { CreateGroupStudentInput } from "../interface/group-student.interface"
import { Student } from "./student.entity"

@Entity()
export class GroupStudent {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  student_id: number

  @Column()
  group_id: number

  @Column()
  incident_count: number

  @ManyToOne(()=>Student,student=>student.groupStudent)
  @JoinColumn({name:"student_id",referencedColumnName:"id"})
  public student: Student;

  public prepareToCreate(input: CreateGroupStudentInput) {
    this.student_id= input.student_id,
    this.group_id= input.group_id,
    this.incident_count= input.incident_count
  }


}


