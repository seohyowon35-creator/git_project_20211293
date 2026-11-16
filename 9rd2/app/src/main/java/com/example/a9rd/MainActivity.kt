package com.example.a9rd

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 뷰 연결
        val num1 = findViewById<EditText>(R.id.num1)
        val num2 = findViewById<EditText>(R.id.num2)
        val addButton = findViewById<Button>(R.id.addButton)
        val result = findViewById<TextView>(R.id.result)

        // 버튼을 누르면 토스트 메시지가 뜨고 동시에 덧셈이 수행됨
        addButton.setOnClickListener {
            // 1. 토스트 메시지 출력
            Toast.makeText(
                this,
                "버튼을 눌렀습니다.",
                Toast.LENGTH_SHORT
            ).show()

            // 2. 두 수 입력값 확인 및 덧셈 연산 수행
            val str1 = num1.text.toString()
            val str2 = num2.text.toString()

            if (str1.isEmpty() || str2.isEmpty()) {
                Toast.makeText(
                    this,
                    "두 숫자를 모두 입력하세요.",
                    Toast.LENGTH_SHORT
                ).show()
                return@setOnClickListener
            }

            val a = str1.toInt()
            val b = str2.toInt()
            val sum = a + b

            result.text = "결과: $sum"
        }
    }
}