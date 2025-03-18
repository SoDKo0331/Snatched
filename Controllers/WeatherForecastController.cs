using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using Dapper;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace aka.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<WeatherForecastController> _logger;

    public WeatherForecastController(ILogger<WeatherForecastController> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    [HttpGet, Route("info")]
    public IActionResult Get()
    {
        var sds = _configuration.GetConnectionString("DefaultConnection");

        using (SqlConnection connection = new SqlConnection(sds))
        {
            return Ok(connection.Query("select * from Test").AsList());
        }
    }
    [HttpGet, Authorize, Route("user")]
    public new IActionResult User(int id)
    {
        var sds = _configuration.GetConnectionString("DefaultConnection");

        Console.Write(" Backend user");

        using (SqlConnection connection = new SqlConnection(sds))
        {
            // You can use the parameterName in your SQL query or perform any other logic.
            return Ok(connection.Query("select * from Test where id = @id", new{id = id}).AsList());
        }
    }

    [HttpPost]
    public IActionResult Post(Temp shoe)
    {
        Console.Write("Posting:  " + shoe.fname);
        var sds = _configuration.GetConnectionString("DefaultConnection");
        using (SqlConnection connection = new SqlConnection(sds))
        {
            return Ok(connection.Query("insert into Test values(@fname, @lname, @password, @roleID)",
             new { fname = shoe.fname, lname = shoe.lname, password = shoe.password, roleid = shoe.roleid }).AsList());
        }
    }

    [HttpPost, Route("login")]
    public IActionResult Login(Ltemp param)
    {
        using (SqlConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
        {
            var sd = connection.Query<Pmet>("select id, lname, roleid from Test where lname = @lname and password = @password", new
            {
                lname = param.lname,
                password = param.password
            }).FirstOrDefault();

           if (sd != null)
            {
                // Generate a JWT token
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.Name, sd.id.ToString()),
                        new Claim(ClaimTypes.Name, sd.id.ToString())
                    }),
                    Expires = DateTime.UtcNow.AddMinutes(Convert.ToInt32(_configuration["Jwt:refreshExpireMinute"])),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                    Issuer = _configuration["Jwt:Issuer"],
                    Audience = _configuration["Jwt:Audience"]
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                return Ok(new { token = tokenString, id = sd.id, roleid = sd.roleid, lname = sd.lname });
            }
            else
            {
                return Unauthorized(null);
            }
            return Ok(new { id = sd.id, roleid = sd.roleid, lname = sd.lname });
        }
    }

    [HttpPost, Route("send")]
    public IActionResult Send(Chats chats)
    {
        Console.Write("Posting:  " + chats.s_username);
        var sds = _configuration.GetConnectionString("DefaultConnection");
        using (SqlConnection connection = new SqlConnection(sds))
        {
            return Ok(connection.Query("insert into Chats values(@sender_id, @receiver_id, @text, @date_time, @s_username, @r_username)",
             new { sender_id = chats.sender_id, receiver_id = chats.receiver_id, text = chats.text,
             date_time = chats.date_time, s_username = chats.s_username, r_username = chats.r_username}).AsList());
        }
    }

    [HttpPut]
    public IActionResult Put(Pmet list)
    {
        Console.Write("Updating|:  " + list.id);

        var data = _configuration.GetConnectionString("DefaultConnection");
        using (SqlConnection connection = new SqlConnection(data))
        {
            return Ok(connection.Query("update Test set fname=@fname, lname=@lname, password=@password, roleid=@roleid where id=@id",
            new { id = list.id, fname = list.fname, lname = list.lname, password = list.password, roleid = list.roleid }).AsList());
        }

    }

    [HttpDelete]
    public IActionResult Delete(int id)
    {
        Console.Write("deleting " + id);

        var data = _configuration.GetConnectionString("DefaultConnection");
        using (SqlConnection connection = new SqlConnection(data))
        {
            return Ok(connection.Query("delete from Test where ID=@ID", new { ID = id }).AsList());
        }

    }

    public class Temp
    {
        public int id { get; set; }
        public required string fname { get; set; }
        public required string lname { get; set; }
        public required string password { get; set; }
        public int roleid { get; set; }
    }

    public class Ltemp
    {
        [Required]
        public string? lname { get; set; }
        public string? password { get; set; }

    }

    public class Chats
    {
        [Required]
        public required int sender_id { get; set; }
        public required string receiver_id{ get; set; }
        public required string text{get; set; }
        public required DateTime date_time{ get; set; }
        public required string s_username { get; set; }
        public required string r_username { get; set; }

    }

    public class Pmet
    {
        [Required]
        public required int id { get; set; }
        public string? fname { get; set; }
        public string? lname { get; set; }
        public string? password { get; set; }
        public int? roleid { get; set; }
    }

}