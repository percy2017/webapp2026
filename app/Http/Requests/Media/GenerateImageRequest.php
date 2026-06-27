<?php

namespace App\Http\Requests\Media;

use Illuminate\Foundation\Http\FormRequest;

class GenerateImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'prompt' => ['required', 'string', 'max:1500'],
            'aspect_ratio' => ['required', 'string', 'in:1:1,16:9,4:3,3:2,2:3,3:4,9:16,21:9'],
            'n' => ['integer', 'min:1', 'max:9'],
            'prompt_optimizer' => ['boolean'],
            'seed' => ['nullable', 'integer'],
            'reference_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:10240'],
        ];

        return $rules;
    }

    public function messages(): array
    {
        return [
            'prompt.required' => 'La descripción es obligatoria.',
            'prompt.max' => 'La descripción no puede superar los 1500 caracteres.',
            'aspect_ratio.required' => 'Selecciona una relación de aspecto.',
            'aspect_ratio.in' => 'La relación de aspecto seleccionada no es válida.',
            'n.min' => 'Debes generar al menos 1 imagen.',
            'n.max' => 'No puedes generar más de 9 imágenes por vez.',
            'reference_image.image' => 'El archivo debe ser una imagen.',
            'reference_image.mimes' => 'La imagen debe ser JPG o PNG.',
            'reference_image.max' => 'La imagen no puede pesar más de 10 MB.',
        ];
    }
}
