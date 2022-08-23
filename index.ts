import { stdin, stdout } from "process"
import * as readline from "readline/promises"
import sqlite from "better-sqlite3"

const db = sqlite("./database.sqlite")
db.exec("CREATE TABLE IF NOT EXISTS class (studentName TEXT, studentAge INTEGER)")



class Class {
    public students: Student[] = []
    showStudents(): void{
        this.students.forEach(student => {
            console.log(`İsim: ${student.name}, Yaş: ${student.age}`)
        })
    }
    addStudent(student: Student): void{
        this.students.push(student)
    }
    removeStudent(studentName: string): void{
        const matchedStudents = this.students.filter(student => student.name === studentName)
        if(matchedStudents.length === 0){
            console.log("Bu öğrenciyi bulamadım.")
            return
        }
        for(let matchedStudent of matchedStudents){
            const index = this.students.indexOf(matchedStudent)
            this.students.splice(index, 1)
        }
    }
}

class Student{
    constructor(public name: string, public age: number){}
}

const rl = readline.createInterface({
    input: stdin,
    output: stdout
})

const ourClass = new Class()
db.prepare("SELECT * FROM class").all().forEach(student => {
    ourClass.addStudent(new Student(student.studentName, student.studentAge))
})



process.on('exit', () => {
    db.exec(`DELETE FROM class`)
    ourClass.students.forEach(student => {
        db.exec(`INSERT INTO class VALUES ('${student.name}', ${student.age})`)
    })
    db.close()
})

async function recursive(){
    const operations =
`İşlem seçin:
1) Öğrenci Kayıt
2) Öğrenci Silme
3) Öğrencileri Listeleme
4) Çıkış
Seçiminiz: `
    
    const operation = await rl.question(operations)
    console.log("\n\n")
    if(operation === "1"){
        const studentName = await rl.question("Öğrenci ismi: ")
        const studentAge = await rl.question("Öğrencinin yaşı: ")
        ourClass.addStudent(new Student(studentName, +studentAge))
    }

    else if(operation === "2"){
        const studentName = await rl.question("Öğrenci ismi: ")
        ourClass.removeStudent(studentName)
    }

    else if(operation === "3"){
        ourClass.showStudents()
    }

    else if(operation === "4") {
        db.exec(`DELETE FROM class`)
        ourClass.students.forEach(student => {
            db.exec(`INSERT INTO class VALUES ('${student.name}', ${student.age})`)
        })
        
        db.close()
        process.exit(0)
    }
    else console.log("Lütfen varolan bir işlemi seçiniz.")

    console.log("\n\n")
    recursive()
}
recursive()
