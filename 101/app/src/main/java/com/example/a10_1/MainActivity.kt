package com.example.a101

import android.app.AlertDialog
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private fun id(name: String) = resources.getIdentifier(name, "id", packageName)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(resources.getIdentifier("activity_main", "layout", packageName))

        val etName = findViewById<EditText>(id("etName"))
        val etPassword = findViewById<EditText>(id("etPassword"))
        val etEmail = findViewById<EditText>(id("etEmail"))
        val etBirth = findViewById<EditText>(id("etBirth"))
        val etPhone = findViewById<EditText>(id("etPhone"))
        val btnSubmit = findViewById<Button>(id("btnSubmit"))

        btnSubmit.setOnClickListener {
            val msg = "성명: ${etName.text}\n" + //이름
                    "비밀번호: ${etPassword.text}\n" + //
                    "이메일: ${etEmail.text}\n" +
                    "생년월일: ${etBirth.text}\n" +
                    "연락처: ${etPhone.text}"
            AlertDialog.Builder(this)
                .setTitle("결과")
                .setMessage(msg)
                .setPositiveButton("확인", null)
                .show()
        }
    }
}