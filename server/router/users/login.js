const { PrismaClient} = require('@prisma/client');
const crypto = require('crypto');
const { generateAccessToken, generateRefreshToken } = require('../../util/jwt');
const prisma = new PrismaClient();
const login = async (req, res) => {
    // 사용자 인증 로직
    const { email, password } = req.body;
    //console.log(req.body);
  
    // 사용자 검증 및 인증 후 사용자 정보 가져오기
    const user = await prisma.user.findFirst({ where: { email  } });
    const hashedLoginPassword = crypto.createHash('sha512').update(password).digest('base64');
    if (!user || user.password !== hashedLoginPassword) {
      return res.status(401).json({ message: '유효하지 않은 사용자 이름 또는 비밀번호입니다.' });
    }
    //console.log(user);
    // Access Token 및 Refresh Token 생성

    const accessToken = generateAccessToken(email);
    const refreshToken = generateRefreshToken(email);
    // Refresh Token을 쿠키로 설정
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.cookie('accessToken', accessToken, {httpOnly : true});
    //console.log(refreshToken);
  
    res.status(200).json({ 
        accessToken,
        refreshToken,
        message : "로그인,토큰발급 성공"
    });
  };

  const logout = (req,res) =>{
    try{
        res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({
        message : "로그아웃 되었습니다."
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            message : "로그아웃 에러"
        })
    }
    
} 

module.exports = {
    login,
    logout
}