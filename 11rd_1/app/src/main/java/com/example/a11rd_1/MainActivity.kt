package com.example.a11rd_1

import android.os.Bundle
import android.view.View
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    lateinit var ivMain: ImageView
    lateinit var btnd2: ImageButton
    lateinit var btnd3: ImageButton
    lateinit var btnd4: ImageButton
    lateinit var btnd5: ImageButton

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        ivMain = findViewById(R.id.ivMain)
        btnd2 = findViewById(R.id.btnd2)
        btnd3 = findViewById(R.id.btnd3)
        btnd4 = findViewById(R.id.btnd4)
        btnd5 = findViewById(R.id.btnd5)

        btnd2.setOnClickListener {
            ivMain.visibility = View.VISIBLE
            ivMain.setImageResource(R.drawable.d2)
            Toast.makeText(applicationContext, "정답입니다.", Toast.LENGTH_SHORT).show()
        }

        btnd3.setOnClickListener {
            ivMain.visibility = View.VISIBLE
            ivMain.setImageResource(R.drawable.d3)
            Toast.makeText(applicationContext, "틀렸습니다.", Toast.LENGTH_SHORT).show()
        }

        btnd4.setOnClickListener {
            ivMain.visibility = View.VISIBLE
            ivMain.setImageResource(R.drawable.d4)
            Toast.makeText(applicationContext, "틀렸습니다.", Toast.LENGTH_SHORT).show()
        }

        btnd5.setOnClickListener {
            ivMain.visibility = View.VISIBLE
            ivMain.setImageResource(R.drawable.d5)
            Toast.makeText(applicationContext, "틀렸습니다.", Toast.LENGTH_SHORT).show()
        }
    }
}