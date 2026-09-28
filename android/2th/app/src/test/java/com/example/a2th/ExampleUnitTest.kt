package com.example.a2th

import android.R
import android.util.Log
import org.junit.Test

import org.junit.Assert.*

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class ExampleUnitTest {
    @Test
    fun addition_isCorrect() {
        assertEquals(4, 2 + 2)

        val myName = "서효원"
        val age: Int = 25

        println("코틀린: 불변 변수 val 나의 이름은 " + myName)


        var numOne = 1
        var numTwo = 30000000
        var myByte : Byte = 1
        var myInt: Int = 20

        println("numOne: $numOne")
        println("numTwo: $numTwo")
        println("myByte: $myByte")
        println("myInt: $myInt")

        var myFloat = 30.2F
        var myDouble = 35.4

        println("코틀린 : 실수 자료형 Float:" + myFloat)
        println("코틀린 : 실수 자료형 Double:" + myDouble)

        var myBoolean : Boolean = true
        println("코틀린 : 부울린 자료형 Boolean:" + myBoolean)

        var myChar1 : Char = 'K'
        var myChar2 : Char = 'o'
        var myChar3 : Char = 't'
        var myChar4 : Char = 'i'
        var myChar5 : Char = 'l'
        var myChar6 : Char = 'n'

        println("코틀린 : 문자 자료형 Char:" + myChar1+myChar2+myChar3+myChar4+myChar5+myChar6)


        var myLong = 25L
        println("myInt: $myLong")

        var myString1 : String = "Kotln\n"
        var myString2 : String = "Java"

        println("코틀린 : 문자열 자료형 String:" + myString1)
        println("코틀린 : 문자열 자료형 String:" + myString2)

        var myArray: IntArray = intArrayOf(1,2,3,4,5)
        println("코틀린 : 배열 자료형 배열의 3번째 값:" + myArray[2])

        var myX: Int = 100
        var myY: Long = myX.toLong()

        println("코틀린 : 자료형 변환 Int : $myX")
        println("코틀린 : 자료형 변환 Long : $myY")


        var x : Int = 4
        var y : Int = 2

        println("코틀린 : 산술자 x+y=${x + y}")
        println("코틀린 : 산술자 x+y=${x - y}")
        println("코틀린 : 산술자 x+y=${x / y}")
        println("코틀린 : 산술자 x+y=${x * y}")
        println("코틀린 : 산술자 x+y=${x % y}")

        println("코틀린 : 비교 연산자 x > y ${x > y}")
        println("코틀린 : 비교 연산자 x < y ${x < y}")
        println("코틀린 : 비교 연산자 x >= y ${x >= y}")
        println("코틀린 : 비교 연산자 x <= y ${x <= y}")
        println("코틀린 : 비교 연산자 x == y ${x == y}")
        println("코틀린 : 비교 연산자 x != y ${x != y}")


        var num:Int = -10
        var result1 : String
        if(num > 0){
            result1 = "숫자"+num+"은 양수"
        } else if (num ==0) {
            result1 = "숫자" + num + "은 0"
        }else {
            result1 = "숫자"+ num +"은 음수"
        }
        println("코틀린 : if-else if 조건문 $result1")

        var num2 :Int = -10
        var result2 : String
        if(num2 > 0){
            if(num2 % 2 ==0){
                result2 = "숫자"+num2+"은 양수이고 짝수"
            }else {
                result2 = "숫자" + num2 + "은 양수이고 홀수"
            }
        } else {
            result2 = "숫자" + num2 + "은 0 또는 음수"
        }

        var day1: Int = 2
        var result : String
        when (day1){
            1->result ="Monday"
            2->result ="Tuesday"
            3->result ="Wendsday"
            4->result ="Thursday"
            5->result ="Friday"
            6->result ="Saturday"
            7->result ="Sunday"
            else -> result = "Invalid day"
        }
        println("코틀린 : 중첩 if 조건문 $result")


        var attendance: Int = 85
        var score: Int = 96
        var grade: String
        var scholarship: String

        if (attendance < 80) {
            grade = "F"
        } else {
            if (score >= 95) {
                grade = "A+"
            } else if (score >= 90) {
                grade = "A"
            } else if (score >= 80) {
                grade = "B"
            } else if (score >= 70) {
                grade = "C"
            } else {
                grade = "F"
            }
        }

        if (grade == "A+" || grade == "A") {
            scholarship = "장학생"
        } else {
            scholarship = "장학생 아님"
        }

        println("코틀린 : 출석률 $attendance, 점수 $score → 학점 $grade, $scholarship")

        for (j in 1..9) {
            for (i in 2..9) {
                print("$i x $j = ${i * j}\t")
            }
            println()
        }

        for (i in 10..13) {
            for (j in 5..10) {
                print("$i x $j = ${i * j}\t")
            }
            println()
        }










    }
}