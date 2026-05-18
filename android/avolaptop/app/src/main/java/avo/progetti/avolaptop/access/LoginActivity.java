package avo.progetti.avolaptop.access;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import java.util.HashMap;
import java.util.Map;

import avo.progetti.avolaptop.R;

public class LoginActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_login);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
        RequestQueue loginQueue = Volley.newRequestQueue(LoginActivity.this);
        String url = "http://10.0.2.2/avolaptop/api/v1/login";
        TextView loginUsername = findViewById(R.id.loginUsername);
        TextView loginPassword = findViewById(R.id.loginPassword);
        Button loginButton = findViewById(R.id.loginLoginButton);
        Button signInButton = findViewById(R.id.loginSign_inButton);
        signInButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent loginSignin = new Intent(LoginActivity.this, SigninActivity.class);
                startActivity(loginSignin);
            }
        });
        loginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                StringRequest loginRequest = new StringRequest(Request.Method.POST, url, new Response.Listener<String>() {
                    @Override
                    public void onResponse(String s) {
                        Log.d("Login Request", "Successed");
                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError volleyError) {
                        Log.e("Login Request", "Failed");
                    }
                }){
                    @Override
                    protected Map<String,String> getParams(){
                        Map<String, String> params = new HashMap<String, String>();
                        params.put("email", loginUsername.getText().toString());
                        params.put("password", loginPassword.getText().toString());
                        return params;
                    }
                    public String getBodyContent() {
                        return "application/x-www-form-urlencoded";
                    }
                };

                loginQueue.add(loginRequest);
            }
        });
    }
}