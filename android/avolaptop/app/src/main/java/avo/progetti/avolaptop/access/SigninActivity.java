package avo.progetti.avolaptop.access;

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

public class SigninActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_sign_in);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
        RequestQueue loginQueue = Volley.newRequestQueue(SigninActivity.this);
        String url = "http://10.0.2.2/avolaptop/api/v1/users";
        TextView sign_inUsername = findViewById(R.id.signInUsername);
        TextView sign_inPassword = findViewById(R.id.signInPassword);
        TextView sign_inSurname = findViewById(R.id.signInSurname);
        TextView sign_inName = findViewById(R.id.signInName);
        Button loginButton = findViewById(R.id.signInLoginButton);
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
                        params.put("email", sign_inUsername.getText().toString());
                        params.put("password", sign_inPassword.getText().toString());
                        params.put("name", sign_inName.getText().toString());
                        params.put("surname", sign_inSurname.getText().toString());
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