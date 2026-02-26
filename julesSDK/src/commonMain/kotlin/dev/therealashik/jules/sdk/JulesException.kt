package dev.therealashik.jules.sdk

sealed class JulesException(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class NetworkError(message: String, cause: Throwable? = null) : JulesException(message, cause)
    class AuthError(message: String) : JulesException(message)
    class ValidationError(message: String) : JulesException(message)
    class ServerError(val statusCode: Int, message: String) : JulesException(message)
}
