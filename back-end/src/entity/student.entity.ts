import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, OneToOne, ManyToOne } from "typeorm"
import { CreateStudentInput, UpdateStudentInput } from "../interface/student.interface"
import { StudentRollState } from "./student-roll-state.entity"
import { GroupStudent } from "./group-student.entity"

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  first_name: string

  @Column()
  last_name: string

  @Column()
  photo_url: string

  @OneToMany(()=>StudentRollState,(rollState)=>rollState.student)
  states: StudentRollState[]

  @OneToMany(()=>GroupStudent,(groupStudent)=>groupStudent.student)
  groupStudent: GroupStudent[]

  public prepareToCreate(input: CreateStudentInput) {
    this.first_name = input.last_name
    this.last_name = input.last_name
    this.photo_url = input.photo_url
  }

  public prepareToUpdate(input: UpdateStudentInput) {
    if (input.first_name !== undefined) this.first_name = input.first_name
    if (input.last_name !== undefined) this.last_name = input.last_name
    if (input.photo_url !== undefined) this.photo_url = input.photo_url
  }
}
