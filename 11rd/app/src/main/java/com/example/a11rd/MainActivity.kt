/*
package com.example.a11rd

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val button = findViewById<Button>(R.id.button_id)
        val image1 = findViewById<ImageView>(R.id.imageView1)
        val image2 = findViewById<ImageView>(R.id.imageView2)

        button.setOnClickListener {
            button.text = "버튼 클릭 이벤또"

            image1.setImageResource(R.drawable.image1)
            image2.setImageResource(R.drawable.image2)

            image1.visibility = View.VISIBLE
            image2.visibility = View.VISIBLE
        }
    }
}
*/