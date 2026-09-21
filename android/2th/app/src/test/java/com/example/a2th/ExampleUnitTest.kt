package com.example.a2th

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




    }
}